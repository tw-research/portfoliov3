import { EditorContent, useEditor } from "@tiptap/react";
import { editorExtensions } from "../../../shared/editor/extensions";

export function PostEditor() {
  const editor = useEditor({
    extensions: editorExtensions,
    content: "<p>Put something here!</p>",
  });

  return <EditorContent editor={editor} />;
}
