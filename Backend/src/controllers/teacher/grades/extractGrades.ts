import { Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import expressAsyncHandler from 'express-async-handler';
import { AuthRequest } from '@auth/authentication';
import OpenAI from 'openai';
import { openAiApiKey } from '@config/envVar';
import { ChatCompletionMessage } from 'openai/resources';
import { BadRequestError, InternalError } from '@core/ApiError';

const openai = new OpenAI({
  apiKey: openAiApiKey,
});

interface Grade {
  id: string;
  grade: number | null | 'ABS' | 'DISP';
}

const parseGrades = (grades: Grade[]): Grade[] => {
  const parsedGrades: Grade[] = [];

  grades.forEach(({ id, grade }) => {
    let normalizedId = id.toString().replace(/\D/g, '');
    if (normalizedId.length !== 8) {
      normalizedId = normalizedId.padStart(8, '0');
    }

    let normalizedGrade: number | null | 'ABS' | 'DISP';

    if (typeof grade === 'number' || !isNaN(Number(grade))) {
      const numericGrade = Number(grade);
      normalizedGrade = Math.round(numericGrade * 4) / 4;
    } else if (grade === 'ABS' || grade === 'DISP') {
      normalizedGrade = grade;
    } else {
      normalizedGrade = 0;
    }

    parsedGrades.push({ id: normalizedId, grade: normalizedGrade });
  });

  return parsedGrades;
};

const parseResponseContent = (response: ChatCompletionMessage) => {
  const content = response?.content!;
  try {
    const result = JSON.parse(content);
    return result;
  } catch (e) {
    throw new BadRequestError('Unable to extract the grades from this image. Please check the quality of the image or try with another image.');
  }
};

export const extractGrades = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { imageUrl } = req.body;

  try {
    // Vérifier que l'image URL est valide
    if (!imageUrl || !imageUrl.startsWith('data:image/')) {
      throw new BadRequestError('Invalid image format. Please provide a valid base64 image.');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'I want you to extract data from the input image containing a table.\r\n\r\nFirst of all, there are two different types of column layout, as the following:\r\n  1. Ordre | Identifiant | N°Inscription | Nom | Prenom | Note | Emargement.\r\n  2. ID | CIN | Nom | Prenom | Entrée | Sortie | Note d\'examen\r\nThe first task for you to do is to idenfity which layout the attached image is in, if you cannot find a table or the layouts of the table that I stated, then return with this simple message "Could not extract grades"."\r\n\r\nAfter identifying the layout, I want you to extract the following data:\r\n- "Identifiant" (NOT N°Inscription) in layout 1 / CIN which is its equivalent in layout 2. This should be a string of 8 digits, if you are unable to idenfity 8 digits then idenfity as much as you can and add 0\'s at the left of the string to fill the missing space.\r\n- "Note" which is a hand written text, even if it is not in the correct position in either of the layouts, you should be able to detect it as it is the only hand written column wich characters in it. It can be both string and a number, when it is a number it is limited between 0 and 20, and it can only be a multiple of 0.25 but it is generally a multiple of 0.5 and this is really important so do not mistake 0.5 for 0.25 and the other way around, only use 0.25 if you can actually see it. If you find it not a multiple of 0.25 or 0.5 then its wrong and try to idenfity better. So it cant be 14.15 for example, if you find it not a multiple of 0.25 or 0.5 then its wrong and try to idenfity better. When its a string, it can be either "ABS" or "DISP" in different formats of caps so it can be "Abs", "abs", "ABS" etc, and "Disp", "disp", "DISP" etc. If you cant find neither a number nor "ABS" or "DISP" then use NULL. There is also another case which is when the column "Note" doesnt have neither a number nor a string, but it is crossed with a horizontal line, in this case it should be marked as "ABS".\r\nThe "Note" column is very important so it needs to be analyzed deeply and accurately.\r\nMake sure to detect the "Identifiant" and "Note" that are in the same row, because sometimes the image can be inclined and they may seem in different rows but it should be easy to identify based on table borders.\r\nThe data output must be in this JSON format like this [{id: identifiant, grade}, {id: identifiant2, grade},{id: identifiant3, grade}, ...]. \r\n%ake sure to not use the code block markdown or add any extra text, just send the JSON directly.\r',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      temperature: 1,
      max_tokens: 512,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (!response.choices[0].message.content) {
      throw new InternalError('Could not extract grades. Please try again.');
    }

    const responseContent = parseResponseContent(response.choices[0].message);
    const grades = parseGrades(responseContent);

    new SuccessResponse('Grades extracted successfully.', grades).send(res);
  } catch (error: any) {
    // Gestion spécifique des erreurs OpenAI
    if (error.code === 'invalid_api_key') {
      throw new InternalError('OpenAI API key is invalid. Please check the configuration.');
    }
    if (error.code === 'insufficient_quota') {
      throw new InternalError('OpenAI API quota exceeded. Please check your billing.');
    }
    if (error.code === 'rate_limit_exceeded') {
      throw new InternalError('OpenAI API rate limit exceeded. Please try again later.');
    }

    // Re-lancer l'erreur si c'est déjà une erreur personnalisée
    if (error instanceof BadRequestError || error instanceof InternalError) {
      throw error;
    }

    // Erreur générique
    throw new InternalError('An error occurred while processing the image. Please try again.');
  }
});
