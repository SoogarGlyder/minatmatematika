import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

export default function MathContent({ content }) {
  // Jika content kosong, tampilkan string kosong
  const safeContent = content || "";

  return (
    <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]} // rehypeRaw agar tag <details> tetap jalan
        components={{
          // Kita bisa mendesain ulang tampilan tag HTML bawaan dari sini!
          details: ({node, ...props}) => (
            <details className="bg-gray-50 border border-gray-200 p-4 rounded-lg my-4" {...props} />
          ),
          summary: ({node, ...props}) => (
            <summary className="cursor-pointer font-bold text-blue-800 mb-2" {...props} />
          )
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}