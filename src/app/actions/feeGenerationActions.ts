"use server";

import { requireAdmin } from "@/app/lib/auth";
import { getFeeGenerationPreview, generateMonthlyFees } from "@/app/lib/fees";
import { revalidatePath } from "next/cache";

export async function previewFeesAction(month: string) {
  await requireAdmin();

  try {
    const rows = await getFeeGenerationPreview(month);

    return {
      success: true,
      message: "",
      rows,
    };
  } catch (error) {
    console.error("Failed to preview monthly fees:", error);

    return {
      success: false,
      message: "Could not preview fees. Please check the selected month.",
      rows: [],
    };
  }
}

export async function generateFeesAction(month: string) {
  await requireAdmin();

  try {
    const result = await generateMonthlyFees(month);

    revalidatePath("/fees");
    revalidatePath("/fees/generate");
    revalidatePath("/");

    return {
      success: true,
      message:
        `Fee generation completed. ${result.generatedCount} fee(s) generated, ` +
        `${result.skippedCount} skipped. Total generated: Rs. ` +
        `${result.totalGenerated.toLocaleString("en-PK")}.`,
    };
  } catch (error) {
    console.error("Failed to generate monthly fees:", error);

    return {
      success: false,
      message:
        "Fee generation failed. No partial changes were committed. Please try again.",
    };
  }
}
