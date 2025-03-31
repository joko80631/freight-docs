const { classifyDocument } = require('./openai');

async function testOpenAIConnection() {
    try {
        const result = await classifyDocument("This is a test invoice document for connection testing.");
        console.log('✅ OpenAI connection successful!');
        console.log('Classification result:', result);
        return true;
    } catch (error) {
        console.error('❌ OpenAI connection failed:', error.message);
        return false;
    }
}

testOpenAIConnection(); 