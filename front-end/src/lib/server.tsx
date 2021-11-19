export type Err = {
    msg: string;
    code: string;
};

const ERRCODE = {
    ONLY_ACCEPTS_JSON: 'ONLY_ACCEPTS_JSON',
    INVALID_FILE_ID: 'INVALID_FILE_ID',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    FETCH_FAILED: 'FETCH_FAILED',
    ACCOUNT_EXISTS: 'ACCOUNT_EXISTS'
};

const useServer = () => {

    function postJSON<Data>(url : string, data : object) : Promise<Data> {
        return fetch(url, {
                body: JSON.stringify(data),
                method: 'POST', 
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            .then(async res => {
                if(res.ok)
                    return res.json();

                const json = await res.json();
            
                throw json;
            })
            .catch((err : any) => {

                if(err.msg && err.code) {
                    throw err as Err;
                }

                throw {
                    msg: 'An unknown error occured',
                    code: ERRCODE.FETCH_FAILED,
                } as Err;
            });
    }

    const Server = {
        signin: (username : string, password : string) =>  {
            return postJSON('/auth/signin', {
                username,
                password,
            });
        },
        signup: (username : string, password : string) => {
            return postJSON('/auth/signup', {
                username,
                password,
            });
        }
    };

    return Server;
};

export { useServer, ERRCODE };