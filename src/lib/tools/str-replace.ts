import { tool } from "ai";
import { z } from "zod";
import { VirtualFileSystem } from "@/lib/file-system";

export function buildStrReplaceTool(fileSystem: VirtualFileSystem) {
  return tool({
    description:
      "Create, view, or edit files using string replacement. Use 'create' to create new files, 'view' to read file contents, 'str_replace' to replace text, and 'insert' to add text at a specific line.",
    parameters: z.object({
      command: z
        .enum(["view", "create", "str_replace", "insert", "undo_edit"])
        .describe("The operation to perform"),
      path: z.string().describe("The file path to operate on"),
      file_text: z
        .string()
        .optional()
        .describe("The file content. Required for 'create' command."),
      insert_line: z
        .number()
        .optional()
        .describe(
          "The line number to insert text at. Required for 'insert' command."
        ),
      new_str: z
        .string()
        .optional()
        .describe(
          "The new string. Required for 'str_replace' and 'insert' commands."
        ),
      old_str: z
        .string()
        .optional()
        .describe(
          "The string to replace. Required for 'str_replace' command."
        ),
      view_range: z
        .array(z.number())
        .optional()
        .describe(
          "Optional [start, end] line range for 'view' command."
        ),
    }),
    execute: async ({ command, path, file_text, insert_line, new_str, old_str, view_range }) => {
      switch (command) {
        case "view":
          return fileSystem.viewFile(
            path,
            view_range as [number, number] | undefined
          );

        case "create":
          return fileSystem.createFileWithParents(path, file_text || "");

        case "str_replace":
          return fileSystem.replaceInFile(path, old_str || "", new_str || "");

        case "insert":
          return fileSystem.insertInFile(path, insert_line || 0, new_str || "");

        case "undo_edit":
          return `Error: undo_edit command is not supported in this version. Use str_replace to revert changes.`;
      }
    },
  });
}
