'use client';
import React from 'react';
import { Box, Stack, IconButton, Tooltip, Paper } from '@mui/material';
import {
    FormatBold,
    FormatItalic,
    FormatListBulleted,
    Code,
    Title,
    FormatListNumbered,
    Link as LinkIcon
} from '@mui/icons-material';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

export default function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Escribe aquí...',
    minHeight = 150
}) {

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                }
            }),
            Underline,
            Link.configure({
                openOnClick: true,
            }),
            Placeholder.configure({
                placeholder
            })
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        }
    });

    if (!editor) return null;

    const setLink = () => {
        const url = prompt('Ingresa la URL');
        if (!url) return;

        editor.chain().focus().setLink({ href: url }).run();
    };

    return (
        <Box>

            {/* TOOLBAR */}
            <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">

                <Tooltip title="Negrita">
                    <IconButton
                        size="small"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        color={editor.isActive('bold') ? 'primary' : 'default'}
                    >
                        <FormatBold fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Cursiva">
                    <IconButton
                        size="small"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        color={editor.isActive('italic') ? 'primary' : 'default'}
                    >
                        <FormatItalic fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Subrayado">
                    <IconButton
                        size="small"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        color={editor.isActive('underline') ? 'primary' : 'default'}
                    >
                        U
                    </IconButton>
                </Tooltip>

                <Tooltip title="Lista">
                    <IconButton
                        size="small"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        color={editor.isActive('bulletList') ? 'primary' : 'default'}
                    >
                        <FormatListBulleted fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Lista numerada">
                    <IconButton
                        size="small"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        color={editor.isActive('orderedList') ? 'primary' : 'default'}
                    >
                        <FormatListNumbered fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Código">
                    <IconButton
                        size="small"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        color={editor.isActive('codeBlock') ? 'primary' : 'default'}
                    >
                        <Code fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Título H2">
                    <IconButton
                        size="small"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
                    >
                        <Title fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Link">
                    <IconButton size="small" onClick={setLink}>
                        <LinkIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

            </Stack>

            {/* EDITOR */}
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    minHeight,
                    cursor: 'text',
                    '& .ProseMirror': {
                        outline: 'none',
                        minHeight,
                    }
                }}
                onClick={() => editor.chain().focus().run()}
            >
                <EditorContent editor={editor} />
            </Paper>
        </Box>
    );
}