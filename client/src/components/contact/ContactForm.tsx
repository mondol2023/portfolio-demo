import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";
import { contactInputSchema, type ContactInput } from "@portfolio/shared";
import { Input, Textarea, Button } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { ApiError, postJson } from "@/lib/api";
import { motionTokens, springs } from "@/lib/animations/tokens";

/**
 * Validated, accessible contact form. Client-side validation mirrors the
 * server's `contactInputSchema` (shared package) so errors surface instantly
 * without a round-trip; the server re-validates everything regardless.
 */
export function ContactForm() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactInputSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", company: "" },
  });

  async function onSubmit(data: ContactInput) {
    try {
      await postJson("/api/contact", data);
      toast({
        title: "Message sent",
        description: "Thanks for reaching out — I'll get back to you soon.",
        tone: "success",
      });
      reset();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          toast({
            title: "Too many messages",
            description: "You've hit the rate limit — please try again in a little while.",
            tone: "warning",
          });
          return;
        }

        if (err.status === 400 && err.details) {
          for (const [field, messages] of Object.entries(err.details)) {
            if (messages?.[0] && field in data) {
              setError(field as keyof ContactInput, { message: messages[0] });
            }
          }
          toast({ title: "Please check the form", description: err.message, tone: "danger" });
          return;
        }

        toast({ title: "Couldn't send that", description: err.message, tone: "danger" });
        return;
      }

      toast({
        title: "Couldn't send that",
        description: "Something went wrong. Please try again in a moment.",
        tone: "danger",
      });
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      initial={{ opacity: 0, y: motionTokens.distance.md }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={springs.gentle}
      className="mx-auto mt-10 flex max-w-xl flex-col gap-5 text-left"
    >
      {/* Honeypot — hidden from sighted/keyboard users via off-screen positioning
          (not display:none, which some bots skip when filling forms) and from
          screen readers via aria-hidden; real visitors never reach or fill it. */}
      <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <Input label="Subject" error={errors.subject?.message} {...register("subject")} />

      <Textarea
        label="Message"
        rows={6}
        error={errors.message?.message}
        {...register("message")}
      />

      <Button type="submit" isLoading={isSubmitting} className="self-center px-8">
        <FiSend aria-hidden="true" /> Send message
      </Button>
    </motion.form>
  );
}
