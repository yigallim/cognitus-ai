import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  ToolOutputItems,
} from "@/components/ai-elements/tool.tsx";
import pythonLogo from "../../assets/pythonicon.webp";
import type { TableData } from "../../components/Table.tsx";

const programmingLanguages = [
  { name: "Python", logo: pythonLogo },
  { name: "jsx", logo: pythonLogo },
];

export interface CodeOutput {
  type: "table" | "text" | "image" | "chart";
  title?: string;
  content?: string | TableData;
}

type CodeBlockProps = {
  title: string;
  code: string;
  language: string;
  codeExplanation: string;
  errorText?: string;
  outputs?: CodeOutput[];
};

function ExpandedCodeBlock({
  title,
  code,
  language,
  codeExplanation,
  errorText,
  outputs,
}: CodeBlockProps) {
  return (
    <Tool defaultOpen={true} className="bg-muted border-black-200 border rounded-xl mb-0">
      <ToolHeader title={title} />
      <ToolContent>
        <ToolInput
          input={code}
          languages={programmingLanguages.find(
            (lang) => lang.name.toLowerCase() === language.toLowerCase()
          )}
        />
        <ToolOutput output={codeExplanation} errorText={errorText} />
      </ToolContent>
      {outputs && outputs.length > 0 && <ToolOutputItems items={outputs} />}
    </Tool>
  );
}

export default ExpandedCodeBlock;
