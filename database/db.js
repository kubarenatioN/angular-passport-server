const db = {
    records: [
        {
            salt: "f932f3f3f3cb2d482d4a6d117c911ca4",
            username: "asdzxc@qew.om",
            password:
                "0f6bf2e1c91cd2dabaa396c98731f8f9b04c30c2aba96540693b0173d4c991ac",
            id: 1,
        },
        {
            salt: "89c5a5c03e41130dcd94a95484825a94",
            username: "asdzxc@qew.om",
            password:
                "ef82b6899fd83968d5c8195f683029b5b4f34ac6ef783a96ff30e3d118a978b8",
            id: 2,
        },
        {
            salt: "f79a92e21fe8c35f35589bc7d18097e2",
            username: "nick@qew.om",
            password:
                "d18185e316c19dabf63b2f066b8275fa97e2d39c8f64d62ad18119c58b252325", // 123
            id: 3,
        },
        {
            salt: '5ed171c6aea72674ffcbbd9679b06765',
            username: 'test@qwe',
            password: '75f89465b1f5179478ff27c5433d26eff013728fe72d384239588346b3593c5e', // qwe
            id: 4
        },          
    ],
    add(record) {
        return new Promise((res, rej) => {
            const newUser = {
                ...record,
                id: this.records.length + 1,
            };
            this.records.push(newUser);
            console.log("111 DB:", this.records);
            res(newUser);
        });
    },
    find(username) {
        return new Promise((res, rej) => {
            const record = this.records.find((r) => r.username === username);
            res(record || null);
        });
    },
};

module.exports = db;
