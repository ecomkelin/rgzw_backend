const test = async () => {
    try {
    } catch (error) {
        throw error; // 重新抛出错误，让外层捕获
    }
}
const demo = async () => {
    try {
    } catch (error) {
        console.error(2222, error);
    }
};

module.exports = demo;