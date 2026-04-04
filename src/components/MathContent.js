import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

export default function MathContent({ content }) {
  const safeContent = content || "";

  return (
    <div className="math-content-wrapper">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          details: ({node, ...props}) => <details {...props} />,
          summary: ({node, ...props}) => <summary {...props} />,
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}