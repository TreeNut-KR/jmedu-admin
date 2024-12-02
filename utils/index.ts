import { josa } from "es-hangul";
import { ChangeEvent } from "react";
import { z } from "zod";

export const customErrorMap: z.ZodErrorMap = (error, ctx) => {
  switch (error.code) {
    case z.ZodIssueCode.too_small:
      if (error.type === "string") {
        return { message: `최소 ${error.minimum}글자를 입력해주세요.` };
      } else if (error.type === "number") {
        return { message: `최소 ${error.minimum}이상의 숫자를 입력해주세요.` };
      } else {
        return { message: `최소 ${error.minimum}이상의 값을 입력해주세요.` };
      }
    case z.ZodIssueCode.too_big:
      if (error.type === "string") {
        return { message: `${error.maximum}글자 이하로 입력해주세요.` };
      } else if (error.type === "number") {
        return { message: `${error.maximum} 이하의 숫자를 입력해주세요.` };
      } else {
        return { message: `${error.maximum} 이하의 값을 입력해주세요.` };
      }
    case z.ZodIssueCode.invalid_type:
      if (error.expected === "string") {
        return { message: `문자를 입력해주세요.` };
      } else if (error.expected === "number") {
        return { message: `숫자를 입력해주세요.` };
      } else if (error.expected === "date") {
        return { message: `날짜를 입력해주세요` };
      } else {
        return { message: `${josa(error.expected, "을/를")} 입력해주세요.` };
      }
    case z.ZodIssueCode.invalid_string:
      if (error.validation === "date") {
        return { message: `올바르지 않은 날짜 형식입니다.` };
      } else {
        return { message: `올바르지 않은 ${error.validation} 형식입니다.` };
      }
  }

  return { message: ctx.defaultError };
};

export const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length < 4) {
    return cleaned;
  } else if (cleaned.length < 8) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }
};

export const unformatPhoneNumber = (value: string) => value.replaceAll(/-/g, "");

export const handlePhoneNumber = (e: ChangeEvent<HTMLInputElement>) => {
  const formattedValue = formatPhoneNumber(e.currentTarget.value);
  e.target.value = formattedValue;
};
