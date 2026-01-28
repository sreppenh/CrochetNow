/**
 * CrochetGenius Logger
 * Simple, consistent console logging
 */

const logger = {
    error: (description, error = null, data = null) => {
        const args = ['❌ CrochetGenius Error:', description];
        if (error) args.push(error);
        if (data) args.push(data);
        console.error(...args);
    },

    success: (description, data = null) => {
        const args = ['✅ CrochetGenius:', description];
        if (data) args.push(data);
        console.log(...args);
    },

    debug: (category, details = null) => {
        const args = [`🔧 ${category}:`, details || ''];
        console.log(...args);
    },

    info: (description, data = null) => {
        const args = ['ℹ️ CrochetGenius:', description];
        if (data) args.push(data);
        console.log(...args);
    },

    warn: (description, data = null) => {
        const args = ['⚠️ CrochetGenius:', description];
        if (data) args.push(data);
        console.warn(...args);
    }
};

export default logger;
