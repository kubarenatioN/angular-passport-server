const getRedirectWindowHtml = (data) => {
    const { token, postBackUri } = data
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Authenticated</title>
        </head>
        <body>
            Authenticated successfully.
            <script type="text/javascript">
                window.addEventListener(
                    'message',
                    function (e) {
                        debugger;
                        console.log('123 test asdasdasd', e)
                        if (
                            e.origin === '${postBackUri}' &&
                            e.data &&
                            e.data.info &&
                            e.data.info.complete
                        ) {
                            window.close();
                        }
                    }
                );
    
                opener.postMessage(
                    {
                        command: 'token-ready',
                        info: {
                            token: '${token}',
                        },
                    },
                    {
                        targetOrigin: '${postBackUri}',
                    }
                );
            </script>
        </body>
    </html>
    `
}

module.exports = { getRedirectWindowHtml }