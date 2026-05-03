'use server';
/**
 * @fileOverview A Genkit flow for Admin AI Shipping Status Update.
 *
 * - adminAIShippingStatusUpdate - A function that generates a concise and professional shipping status update message.
 * - AdminAIShippingStatusUpdateInput - The input type for the adminAIShippingStatusUpdate function.
 * - AdminAIShippingStatusUpdateOutput - The return type for the adminAIShippingStatusUpdate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminAIShippingStatusUpdateInputSchema = z.object({
  shippingStatus: z
    .string()
    .describe(
      'The current status of the shipping order (e.g., "Đang chờ", "Thành công", "Thất bại").'
    ),
  trackingCode: z
    .string()
    .describe('The tracking code of the shipping order. Optional.')
    .optional(),
});
export type AdminAIShippingStatusUpdateInput = z.infer<
  typeof AdminAIShippingStatusUpdateInputSchema
>;

const AdminAIShippingStatusUpdateOutputSchema = z.object({
  message: z.string().describe('The generated concise and professional shipping status update message.'),
});
export type AdminAIShippingStatusUpdateOutput = z.infer<
  typeof AdminAIShippingStatusUpdateOutputSchema
>;

export async function adminAIShippingStatusUpdate(
  input: AdminAIShippingStatusUpdateInput
): Promise<AdminAIShippingStatusUpdateOutput> {
  return adminAIShippingStatusUpdateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminAIShippingStatusUpdatePrompt',
  input: {schema: AdminAIShippingStatusUpdateInputSchema},
  output: {schema: AdminAIShippingStatusUpdateOutputSchema},
  prompt: `Bạn là một trợ lý AI giúp tạo thông báo cập nhật trạng thái vận đơn. Nhiệm vụ của bạn là tạo ra một tin nhắn ngắn gọn, chuyên nghiệp và lịch sự cho người dùng, thông báo về trạng thái hiện tại của đơn hàng. Tin nhắn nên phù hợp với trạng thái được cung cấp và dễ hiểu.

Sử dụng các thông tin sau:
Trạng thái vận đơn hiện tại: {{{shippingStatus}}}

{{#if trackingCode}}
Mã vận đơn: {{{trackingCode}}}
{{/if}}

Hãy tạo tin nhắn cập nhật trạng thái vận đơn.`,
});

const adminAIShippingStatusUpdateFlow = ai.defineFlow(
  {
    name: 'adminAIShippingStatusUpdateFlow',
    inputSchema: AdminAIShippingStatusUpdateInputSchema,
    outputSchema: AdminAIShippingStatusUpdateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
