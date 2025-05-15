import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const adTextSchema = z.object({
  primaryText: z.string()
    .min(1, "Primary text is required")
    .max(125, "Primary text must be 125 characters or less"),
  headline: z.string()
    .min(1, "Headline is required")
    .max(40, "Headline must be 40 characters or less"),
  description: z.string()
    .max(40, "Description must be 40 characters or less")
    .optional(),
  cta: z.string().min(1, "Call to action is required"),
  websiteUrl: z.string()
    .url("Please enter a valid URL")
    .min(1, "Website URL is required"),
});

type AdTextFormValues = z.infer<typeof adTextSchema>;

interface AdTextFormProps {
  onSubmit: (values: AdTextFormValues) => void;
  defaultValues?: Partial<AdTextFormValues>;
}

export function AdTextForm({ onSubmit, defaultValues }: AdTextFormProps) {
  const form = useForm<AdTextFormValues>({
    resolver: zodResolver(adTextSchema),
    defaultValues: {
      primaryText: defaultValues?.primaryText || "Transform your social media presence with our AI-powered design tools. No design skills needed!",
      headline: defaultValues?.headline || "Create stunning ads in minutes!",
      description: defaultValues?.description || "No design skills needed. Try it today!",
      cta: defaultValues?.cta || "sign_up",
      websiteUrl: defaultValues?.websiteUrl || "https://example.com/signup",
    },
  });

  const watchPrimaryText = form.watch("primaryText", "");
  const watchHeadline = form.watch("headline", "");
  const watchDescription = form.watch("description", "");

  // Handle changes and auto-submit
  const handleValueChange = (values: Partial<AdTextFormValues>) => {
    form.setValue("primaryText", values.primaryText || form.getValues("primaryText"));
    form.setValue("headline", values.headline || form.getValues("headline"));
    form.setValue("description", values.description || form.getValues("description"));
    form.setValue("cta", values.cta || form.getValues("cta"));
    form.setValue("websiteUrl", values.websiteUrl || form.getValues("websiteUrl"));
    
    // Call onSubmit with the updated form values
    onSubmit(form.getValues());
  };

  return (
    <div className="mb-8">
      <h3 className="text-base font-medium mb-2">Ad Text</h3>
      <Form {...form}>
        <form className="space-y-4" onChange={() => onSubmit(form.getValues())}>
          <FormField
            control={form.control}
            name="primaryText"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Primary Text</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field}
                    rows={3}
                    className="resize-none focus:ring-[#1877F2] focus:border-[#1877F2]"
                    placeholder="Enter the main body text of your ad"
                    onChange={(e) => {
                      field.onChange(e);
                      handleValueChange({ primaryText: e.target.value });
                    }}
                  />
                </FormControl>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-[#65676B]">Use {'{first_name}'} to personalize</span>
                  <span className="text-xs text-[#65676B]">{watchPrimaryText.length}/125</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Headline</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    className="focus:ring-[#1877F2] focus:border-[#1877F2]"
                    placeholder="Enter a short, attention-grabbing headline"
                    onChange={(e) => {
                      field.onChange(e);
                      handleValueChange({ headline: e.target.value });
                    }}
                  />
                </FormControl>
                <div className="flex justify-between mt-1">
                  <div></div>
                  <span className="text-xs text-[#65676B]">{watchHeadline.length}/40</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Description</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    className="focus:ring-[#1877F2] focus:border-[#1877F2]"
                    placeholder="Add a short description (optional)"
                    onChange={(e) => {
                      field.onChange(e);
                      handleValueChange({ description: e.target.value });
                    }}
                  />
                </FormControl>
                <div className="flex justify-between mt-1">
                  <div></div>
                  <span className="text-xs text-[#65676B]">{watchDescription.length}/40</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cta"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Call to Action</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleValueChange({ cta: value });
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="focus:ring-[#1877F2] focus:border-[#1877F2]">
                      <SelectValue placeholder="Select a call to action" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="learn_more">Learn More</SelectItem>
                    <SelectItem value="sign_up">Sign Up</SelectItem>
                    <SelectItem value="shop_now">Shop Now</SelectItem>
                    <SelectItem value="download">Download</SelectItem>
                    <SelectItem value="get_offer">Get Offer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Website URL</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="url"
                    className="focus:ring-[#1877F2] focus:border-[#1877F2]"
                    placeholder="Enter the URL where people will go when they click"
                    onChange={(e) => {
                      field.onChange(e);
                      handleValueChange({ websiteUrl: e.target.value });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
