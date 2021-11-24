import React, { FC } from 'react';

import Chip from '@mui/material/Chip';
import { Typography } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

import { styled } from '@mui/material/styles';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { Diagnostic } from '../../../lib/LinterAnalysis';
import { SuggestionControl, SuggestionEnumeration } from '../suggestion';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    maxWidth: 350
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#f5f5f9',
  }
}));

export interface CodeSuggestionProps {
    Diagnostic: Diagnostic;
    control: SuggestionControl;
    enumerated: SuggestionEnumeration; 
};

const CodeSuggestion : FC<CodeSuggestionProps> = ({children, Diagnostic, control, enumerated, ...props}) => {
    const Icon = Diagnostic.Level === "Warning" ? WarningAmberIcon : ErrorOutlineIcon;
    const open = control.selectedSuggest === Diagnostic.DiagnosticId;

    let msg = Diagnostic.DiagnosticMessage.Message;

    if(Diagnostic.DiagnosticMessage.EOF) {
        msg += " (Identified at end of file.)"
    }

    return (
        <HtmlTooltip
            title={
                <>
                <div
                    style={{
                    lineHeight: '2rem',
                    display: 'flex'
                    }}
                >
                    <Typography
                    variant="h6"
                    sx={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                    }}
                    >
                    <Icon
                        sx={{
                        display: 'inline-block',
                        verticalAlign: 'text-top',
                        marginRight: '0.4rem'
                        }}
                    />
                    {Diagnostic.DiagnosticName}
                    </Typography>
                </div>
                <div style={{
                    margin: '0.25em 0'
                }}>
                <Typography variant="body2">
                    {msg}
                </Typography>
                </div>
                <div style={{display: 'flex'}}>
                    <div style={{flexGrow: 1}} />
                    <div>
                    <Chip
                        label={
                        `${enumerated.indexOf(Diagnostic.DiagnosticId) + 1}/${enumerated.enum.length}`
                        }
                        size="small"
                    />
                    </div>
                </div>
                </>
            }
            onOpen={control.openSuggestionCallback(Diagnostic.DiagnosticId)}
            onClose={control.closeSuggestionCallback(Diagnostic.DiagnosticId)}
            open={open}
            arrow
        >
            <div id={Diagnostic.DiagnosticId}>
                {children}
            </div>
        </HtmlTooltip>
    );
};

export default CodeSuggestion;