import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import type { User } from "@/types/userTypes";

const profileFormSchema = z.object({
  email: z.email("Please enter a valid email address."),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  userName: z.string().min(4, {
    message: "Username must be at least 4 characters.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type Props = {
  mode: "edit" | "create";
  formData: Partial<User>;
  onSubmit: (formData: Partial<User>) => void;
  isSubmitting: boolean;
};

const ProfileForm = ({ mode, formData, onSubmit, isSubmitting }: Props) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: formData.email || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      userName: formData.userName || "",
    },
    mode: "onChange",
  });

  const handleSubmit = (values: ProfileFormValues) => {
    onSubmit({
      ...values,
      clerkId: formData.clerkId,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {mode === "create" ? "Complete Your Profile" : "Edit Profile"}
        </h2>
        <p className="text-muted-foreground">
          {mode === "create"
            ? "Please provide your profile information"
            : "Update your profile information"}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="john.doe@example.com"
                    type="email"
                    disabled={mode === "edit"}
                    {...field}
                  />
                </FormControl>
                {mode === "edit" && (
                  <FormDescription>
                    Contact support to change your email address
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-fit"
            >
              {isSubmitting && <LoadingSpinner />}
              {mode === "create" ? "Create Profile" : "Update Profile"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileForm;
