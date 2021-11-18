export type DiagnosticeMessage = {
    FileOffset : number;
    Path : string;
    Message : string;
    Replacements : any;
};

export type Diagnostic = {
    BuildDirectory : string;
    DiagnosticMessage : DiagnosticeMessage;
    DiagnosticName : string;
    Level : "Warning" | "Error";
};

export type LinterAnalysis = {
    [fileName: string] : {
        Diagnostics: Diagnostic[];
        MainSourceFile : string;
    };
}

// user -> upload
export type Err = {
    err: string;
};

export type SourceFile = {
    name: string;
    Diagnostics?: Diagnostic[];
};

export type SourceMap = {
    [id: string]: SourceFile;
};

export type UploadResult = SourceMap | Err;