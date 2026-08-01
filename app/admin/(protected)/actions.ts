"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/session";
import { supabase } from "@/lib/supabase";

async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    throw new Error("Unauthorized");
  }
}

function requiredText(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${key} is required`);
  }
  return value.trim();
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

export async function addFaq(formData: FormData) {
  await requireAdminSession();

  const category = requiredText(formData, "category");
  const question_examples = requiredText(formData, "question_examples");
  const answer = requiredText(formData, "answer");

  const { error } = await supabase.from("faqs").insert({ category, question_examples, answer });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function updateFaq(formData: FormData) {
  await requireAdminSession();

  const id = requiredText(formData, "id");
  const category = requiredText(formData, "category");
  const question_examples = requiredText(formData, "question_examples");
  const answer = requiredText(formData, "answer");

  const { error } = await supabase
    .from("faqs")
    .update({ category, question_examples, answer, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteFaq(formData: FormData) {
  await requireAdminSession();

  const id = requiredText(formData, "id");
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function addNotice(formData: FormData) {
  await requireAdminSession();

  const message = requiredText(formData, "message");
  const is_active = formData.get("is_active") === "on";

  const { error } = await supabase.from("notices").insert({ message, is_active });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function updateNotice(formData: FormData) {
  await requireAdminSession();

  const id = requiredText(formData, "id");
  const message = requiredText(formData, "message");
  const is_active = formData.get("is_active") === "on";

  const { error } = await supabase.from("notices").update({ message, is_active }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteNotice(formData: FormData) {
  await requireAdminSession();

  const id = requiredText(formData, "id");
  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}
