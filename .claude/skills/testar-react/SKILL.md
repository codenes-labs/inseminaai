---
name: testar-react
description: Use ao escrever testes de componentes, serviços ou formulários React do InseminaAI.
---

# Testar React

A spec original falava Angular. O app é React. As regras são as mesmas, na stack atual.

1. Regra de negócio é testada no domain e no application, sem React e sem Supabase.
2. Casos de uso são testados com repositórios falsos.
3. Componentes são testados pelo comportamento visível, com Testing Library.
4. Formulários: campos obrigatórios, mensagens de erro e envio com dados válidos.
5. Componentes não acessam o Supabase direto: chamam casos de uso.
6. Evite testes que dependem de tempo real: use datas fixas para tentativa, diagnóstico e previsão de parto.

Cada feature tem ao menos um teste ponta a ponta com Playwright no caminho principal, em tela de celular.
