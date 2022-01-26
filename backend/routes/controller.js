// const workerpool = require('workerpool')
// const path = require('path')

// let poolProxy = null;

// const init = async (options) => {
//     const pool = workerpool.pool(path.join(__dirname+'/threads.js'), options);
//     poolProxy = await pool.proxy();
//     console.log(`Workers enabled.`);
// }

// const get = () => {
//     return poolProxy;
// }

// exports.init = init;
// exports.get = get;