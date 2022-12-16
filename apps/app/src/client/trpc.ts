"use client";

import { createTRPCReact } from "@trpc/react-query";

import { type AppRouter } from "@barely/api";

export const trpc = createTRPCReact<AppRouter>();
