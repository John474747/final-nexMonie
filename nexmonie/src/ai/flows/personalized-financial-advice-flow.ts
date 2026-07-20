'use server';
/**
 * @fileOverview An AI-powered financial advisor that provides personalized tips based on user spending patterns and financial goals.
 *
 * - getPersonalizedFinancialAdvice - A function that handles the generation of financial advice.
 * - PersonalizedFinancialAdviceInput - The input type for the getPersonalizedFinancialAdvice function.
 * - PersonalizedFinancialAdviceOutput - The return type for the getPersonalizedFinancialAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedFinancialAdviceInputSchema = z.object({
  spendingPatterns: z
    .string()
    .describe(
      'A detailed description of the user\'s recent spending habits, categories, and any significant transactions.'
    ),
  currentBalance: z
    .number()
    .describe('The user\'s current available balance in NGN.'),
  financialGoals: z
    .string()
    .describe(
      'The user\'s stated financial goals, such as saving for a house, retirement, debt repayment, or specific investments.'
    ),
});
export type PersonalizedFinancialAdviceInput = z.infer<
  typeof PersonalizedFinancialAdviceInputSchema
>;

const PersonalizedFinancialAdviceOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the overall financial advice provided.'),
  tips: z
    .array(z.string())
    .describe('An array of specific, actionable personalized financial tips and strategies.'),
});
export type PersonalizedFinancialAdviceOutput = z.infer<
  typeof PersonalizedFinancialAdviceOutputSchema
>;

export async function getPersonalizedFinancialAdvice(
  input: PersonalizedFinancialAdviceInput
): Promise<PersonalizedFinancialAdviceOutput> {
  return personalizedFinancialAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedFinancialAdvicePrompt',
  input: { schema: PersonalizedFinancialAdviceInputSchema },
  output: { schema: PersonalizedFinancialAdviceOutputSchema },
  prompt: `You are the NexTips Advisor, an AI-powered financial expert for Nex Monie users. Your goal is to analyze the user's financial situation and provide personalized, actionable financial tips and strategies.
Focus on suggestions for automated daily savings, consistent wealth growth, and improving overall financial health.

Use the following information to generate your advice:

Current Available Balance: ₦{{{currentBalance}}}
Financial Goals: {{{financialGoals}}}
Spending Patterns: {{{spendingPatterns}}}

Based on this information, please provide a summary of your advice and an array of specific, personalized tips. Ensure the tips are practical and directly address the user's spending patterns and goals.`,
});

const personalizedFinancialAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedFinancialAdviceFlow',
    inputSchema: PersonalizedFinancialAdviceInputSchema,
    outputSchema: PersonalizedFinancialAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate personalized financial advice.');
    }
    return output;
  }
);
