const mysql = require('mysql2/promise');

const createConnection = async () => {
 return await mysql.createConnection({
    host: '179.188.16.32',
    user: 'apizap',
    password: 'Dev@2009201',
    database: 'apizap'
 });
}
const getReply = async (keyword) => {
	const connection = await createConnection();
	const [rows] = await connection.execute (' Select resposta From chatbot WHERE pergunta = ?', [keyword]);
	if (rows.length > 0) return rows[0]. resposta;
	return false;
}
const getWelcome = async (keyword) => {
	const connection = await createConnection();
	const [rows] = await connection.execute (' Select resposta From batata WHERE pergunta = ?', [keyword]);
	if (rows.length > 0) return rows[0]. resposta;
	return false;
}
const getUser = async (user) => {
    const connection = await createConnection();
	const [rows] = await connection.execute('SELECT user FROM user WHERE user = ?', [user]);
	if (rows.length > 0 ) return rows[0].message;
	return false;
}

const setUser = async (user) => {
    const data = new Date.now()
    let dataAtual = new Date().toLocaleDateString().slice(0, 10)
    const hora = String(data.getHours()).padStart(2, '0') //14:00 = 1 -> 14 
	const connection = await createConnection();
	const [rows] = await connection.execute('INSERT INTO user(user, dt_create, hr_create) VALUES(?, ?, ?)', [user, dataAtual, hora]);
	if (rows.length > 0) return rows[0].message;
	return false;
}
	
module.exports = {
	createConnection,
	getReply,
    getWelcome,
	getUser,
	setUser
}