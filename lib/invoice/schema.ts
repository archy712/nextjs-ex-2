import { z } from "zod"

import {
  INVOICE_PROPERTY_NAMES,
  ITEM_PROPERTY_NAMES,
} from "@/lib/notion/property-names"

const HEX32_ID_REGEX = /^[0-9a-fA-F]{32}$/
const HYPHENATED_UUID_ID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const invoiceIdSchema = z.union([
  z.string().regex(HEX32_ID_REGEX),
  z.string().regex(HYPHENATED_UUID_ID_REGEX),
])

const notionRichTextItemSchema = z.object({
  plain_text: z.string(),
})

const notionTitlePropertySchema = z.object({
  type: z.literal("title"),
  title: z.array(notionRichTextItemSchema),
})

const notionRichTextPropertySchema = z.object({
  type: z.literal("rich_text"),
  rich_text: z.array(notionRichTextItemSchema),
})

const notionDatePropertySchema = z.object({
  type: z.literal("date"),
  date: z
    .object({
      start: z.string(),
      end: z.string().nullable(),
    })
    .nullable(),
})

const notionNumberPropertySchema = z.object({
  type: z.literal("number"),
  number: z.number().nullable(),
})

const notionFormulaNumberPropertySchema = z.object({
  type: z.literal("formula"),
  formula: z.object({
    type: z.literal("number"),
    number: z.number().nullable(),
  }),
})

const notionRollupNumberPropertySchema = z.object({
  type: z.literal("rollup"),
  rollup: z.object({
    type: z.literal("number"),
    number: z.number().nullable(),
  }),
})

const notionRelationPropertySchema = z.object({
  type: z.literal("relation"),
  relation: z.array(z.object({ id: z.string() })),
  has_more: z.boolean(),
})

export const notionInvoicePageSchema = z.object({
  id: z.string(),
  properties: z.object({
    [INVOICE_PROPERTY_NAMES.invoiceNumber]: notionTitlePropertySchema,
    [INVOICE_PROPERTY_NAMES.clientName]: notionRichTextPropertySchema,
    [INVOICE_PROPERTY_NAMES.validUntil]: notionDatePropertySchema,
    [INVOICE_PROPERTY_NAMES.items]: notionRelationPropertySchema,
    [INVOICE_PROPERTY_NAMES.totalAmount]: notionRollupNumberPropertySchema,
  }),
})

export const notionItemPageSchema = z.object({
  id: z.string(),
  properties: z.object({
    [ITEM_PROPERTY_NAMES.description]: notionTitlePropertySchema,
    [ITEM_PROPERTY_NAMES.quantity]: notionNumberPropertySchema,
    [ITEM_PROPERTY_NAMES.unitPrice]: notionNumberPropertySchema,
    [ITEM_PROPERTY_NAMES.amount]: notionFormulaNumberPropertySchema,
    [ITEM_PROPERTY_NAMES.invoice]: notionRelationPropertySchema,
  }),
})
