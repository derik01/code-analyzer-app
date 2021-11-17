export type DiagnosticMessage = {
    FileOffset : number;
    FilePath : string;
    Message : string;
    Replacements : any;
};

export type Diagnostic = {
    BuildDirectory : string;
    DiagnosticMessage : DiagnosticMessage;
    DiagnosticName : string;
    Level : "Warning" | "Error";
};

export type LinterAnalysis = {
    [suggestion: string] : {
        Diagnostics: Diagnostic[];
        MainSourceFile : string;
    };
}

export type SourceFile = {
    name: string;
    Diagnostics?: Diagnostic[];
};

export type SourceMap = {
    [id: string]: SourceFile;
};