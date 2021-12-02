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

export type AnalysisResponse = {
    analysis_id: string;
};




const useServer = () => {

    const cannonicalizeErrorHanding = (err : any) => {
        if(err.msg && err.code) {
            throw err as Err;
        }

        throw {
            msg: 'An unknown error occured',
            code: ERRCODE.FETCH_FAILED,
        } as Err;
    }

    const forceJSON = async(res : Response) => {
        if(res.ok)
            return res.json();

        const json = await res.json();
    
        throw json;
    }

    function postJSON<Data>(url : string, data : object) : Promise<Data> {
        return fetch(url, {
                body: JSON.stringify(data),
                method: 'POST', 
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            .then(forceJSON)
            .catch(cannonicalizeErrorHanding);
    }

    const Server = {
        signin: (email : string, password : string) => {
            return postJSON('/auth/login', {
                email,
                password,
            }) as Promise<{}>;
        },
        signup: (email : string, password : string) => {
            return postJSON('/auth/register', {
                email,
                password,
            }) as Promise<{}>;
        },
        upload_files: (files : File[]) => {
            const formData = new FormData();

            for(const file of files) {
                formData.append('files', file, file.name);
            }

            return fetch('/user/upload', {
                method: 'POST',
                body: formData
            })
            .then(forceJSON)
            .catch(cannonicalizeErrorHanding) as Promise<AnalysisResponse>;
        }
  
    };

    return Server;
};

export { useServer, ERRCODE };
