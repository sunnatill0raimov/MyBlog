import express from "express"

const app = express()
const PORT = 3003

app.listen(PORT, () => {
	console.log('Server runnig this http://locolhost:3003');
})
