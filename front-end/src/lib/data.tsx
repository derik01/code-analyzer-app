import useSWR from 'swr';

import { SourceMap } from '../lib/LinterAnalysis';

const fetcher = (url : string) => 
    fetch(url).then((res) => res.json());

const useSourceMap = (analyisId : string | undefined) => {
    const { data, error } = useSWR<SourceMap>(`/user/analysis/${analyisId}`, fetcher);

    return {
        sourceMap: data,
        err: error
    };
};

export type pastSubmissions = {
    [analysId : string]: string
};

const useSourceFile = (analyisId : string, fileId : string) => {
    const search = new URLSearchParams();
    search.append('file_id', fileId);

    const { data, error } = useSWR<string>(
        `/user/analysis/${analyisId}/get_file?${search.toString()}`, 
        (url : string) => fetch(url).then((res) => res.text())
    );

    return {
        sourceFile: data,
        err: error
    };
};

const usePastAnalyses = () => {
    const { data, error } = useSWR<pastSubmissions>(
        '/user/get_analyses',
        fetcher
    );

    return {
        pastAnalyses: data,
        err: error
    };
}

export {
    useSourceFile,
    useSourceMap,
    usePastAnalyses
};