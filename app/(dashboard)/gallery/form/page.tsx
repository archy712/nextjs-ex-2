"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const profileFormSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  email: z.email("올바른 이메일 주소를 입력해주세요."),
  bio: z.string().max(160, "자기소개는 최대 160자까지 입력할 수 있습니다.").optional(),
  role: z.string().min(1, "역할을 선택해주세요."),
  marketingEmails: z.boolean(),
  terms: z.boolean().refine((value) => value === true, {
    message: "계속하려면 이용약관에 동의해야 합니다.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultValues: ProfileFormValues = {
  name: "",
  email: "",
  bio: "",
  role: "",
  marketingEmails: false,
  terms: false,
}

export default function FormGalleryPage() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  function onSubmit(data: ProfileFormValues) {
    toast.success("프로필이 업데이트되었습니다", {
      description: `${data.name}님의 변경사항이 저장되었습니다.`,
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">폼 예제</h1>
        <p className="mt-1 text-muted-foreground">
          React Hook Form, Zod 검증, shadcn/ui Field 컴포넌트로 만든 프로필
          폼입니다.
        </p>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>프로필 설정</CardTitle>
          <CardDescription>아래에서 프로필 정보를 수정하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-form-name">이름</FieldLabel>
                    <Input
                      {...field}
                      id="profile-form-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="홍길동"
                      autoComplete="name"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-form-email">이메일</FieldLabel>
                    <Input
                      {...field}
                      id="profile-form-email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="hong@example.com"
                      autoComplete="email"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-form-role">역할</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="profile-form-role"
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue placeholder="역할을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">관리자</SelectItem>
                        <SelectItem value="member">멤버</SelectItem>
                        <SelectItem value="viewer">뷰어</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="bio"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="profile-form-bio">자기소개</FieldLabel>
                    <Textarea
                      {...field}
                      id="profile-form-bio"
                      aria-invalid={fieldState.invalid}
                      placeholder="자신에 대해 간단히 소개해주세요"
                    />
                    <FieldDescription>선택 항목이며 최대 160자까지 입력할 수 있습니다.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <FieldSeparator />

              <Controller
                name="marketingEmails"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor="profile-form-marketing">마케팅 이메일</FieldLabel>
                      <FieldDescription>가끔 제품 업데이트 소식을 받습니다.</FieldDescription>
                    </FieldContent>
                    <Switch
                      id="profile-form-marketing"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />

              <Controller
                name="terms"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} orientation="horizontal">
                    <Checkbox
                      id="profile-form-terms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="profile-form-terms">
                        이용약관에 동의합니다
                      </FieldLabel>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              초기화
            </Button>
            <Button type="submit" form="profile-form">
              저장
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  )
}
