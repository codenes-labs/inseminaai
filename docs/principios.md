# Princípios

O desenvolvimento segue **SDD (Spec-Driven Development)**: nenhuma funcionalidade nasce sem uma especificação escrita antes. O código é consequência da especificação, e cada especificação tem testes que a comprovam.

## Ciclo de cada funcionalidade

1. **Especificar:** escrever a spec com objetivo, regras de negócio e critérios de aceite
2. **Testar primeiro (vermelho):** escrever os testes unitários que cobrem os critérios
3. **Implementar (verde):** o mínimo de código para os testes passarem
4. **Refatorar:** limpar o código com os testes protegendo, aplicando Clean Code e SOLID
5. **Fechar:** atualizar a spec se algo mudou, e só então marcar como concluída

## Princípios de código

- **Clean Code:** nomes que revelam intenção, funções pequenas com uma responsabilidade, sem comentários que explicam código confuso, sem números mágicos
- **SOLID:** responsabilidade única, dependência de abstrações, interfaces pequenas
- **DRY e KISS:** não repetir regra de negócio; a solução mais simples que atende a spec
- **TypeScript estrito:** strict ligado, sem `any`, tipos gerados a partir do esquema do Supabase quando o banco existir
- **Regras de negócio puras:** cálculo de tentativa, data de diagnóstico e previsão de parto ficam em funções puras, sem depender de React nem de Supabase

## Camadas

| Camada | Responsabilidade | Depende de |
| --- | --- | --- |
| domain | Entidades, tipos e regras de negócio puras | nada |
| application | Casos de uso | domain |
| infrastructure | Acesso ao Supabase, implementa repositórios | application, domain |
| presentation | Componentes, páginas e formulários | application |

A regra de dependência aponta para dentro: o domínio não conhece ninguém. Trocar o Supabase no futuro afeta apenas infrastructure.

## Definition of Done

Uma tarefa só está pronta quando: a spec existe e está atualizada, os testes unitários passam, o código foi refatorado, o lint e o build passam sem aviso, e a regra de segurança por `cadastro_id` foi testada quando a tarefa mexe em dados.

## Interface

- Celular primeiro, uso com uma mão
- Botões grandes, poucos campos por tela
- Identidade verde já definida no app
- Textos em português do Brasil
- Não alterar o design existente sem pedido explícito
