const app = requrie('express')();

app.get('/', (req, res) =>
    res.json({ message: 'Docker is easy'})
);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log('app listening on 8080'));