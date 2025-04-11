import React from 'react';

const TypographyTest: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="mb-8">Typography System Test</h1>
      
      <section className="mb-12">
        <h2 className="mb-6">Headings</h2>
        <h1>Heading 1 (72px)</h1>
        <h2>Heading 2 (46px)</h2>
        <h3>Heading 3 (28px)</h3>
        <h4>Heading 4 (20px)</h4>
        <h5>Heading 5 (16px)</h5>
        <p className="heading-long">Heading Long (22px) - This is a longer heading that demonstrates the Heading Long style.</p>
      </section>
      
      <section className="mb-12">
        <h2 className="mb-6">Body Text</h2>
        <p className="body-large">Body Large (18px) - This is the body large text style. It's used for featured text, introductory paragraphs, or emphasized content.</p>
        <p className="body-medium">Body Medium (16px) - This is the standard paragraph text style used throughout the interface.</p>
        <p className="body-small">Body Small (14px) - This is used for secondary information, captions, or supporting text.</p>
        <p className="strong-medium">Strong Medium (16px) - This is used for emphasized text within body content that requires additional visual weight.</p>
      </section>
      
      <section className="mb-12">
        <h2 className="mb-6">Text Alignment</h2>
        <p className="text-left">Left aligned text</p>
        <p className="text-center">Center aligned text</p>
        <p className="text-right">Right aligned text</p>
        <p className="text-justify">Justified text - This text is justified to demonstrate the text-justify utility class. It spreads the text evenly across the width of the container.</p>
      </section>
      
      <section className="mb-12">
        <h2 className="mb-6">Text Decoration</h2>
        <p className="underline">Underlined text</p>
        <p className="line-through">Line through text</p>
        <p className="no-underline">No underline text (removes underline from links)</p>
      </section>
      
      <section className="mb-12">
        <h2 className="mb-6">Text Transform</h2>
        <p className="uppercase">Uppercase text</p>
        <p className="lowercase">LOWERCASE TEXT</p>
        <p className="capitalize">capitalized text</p>
        <p className="normal-case">Normal case text</p>
      </section>
      
      <section className="mb-12">
        <h2 className="mb-6">Responsive Test</h2>
        <p className="text-gray-600">Resize your browser window to see how the typography responds to different screen sizes.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3>Desktop</h3>
            <p>Default sizes apply</p>
          </div>
          <div>
            <h3>Tablet/Mobile</h3>
            <p>Smaller sizes for screens below 810px</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TypographyTest; 