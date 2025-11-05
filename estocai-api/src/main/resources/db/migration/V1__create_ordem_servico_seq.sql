-- src/main/resources/db/migration/V1__create_ordem_servico_seq.sql
CREATE SEQUENCE ordem_servico_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Opcional: vincula a sequence à coluna (garante remoção automática se a coluna/tabela for dropada)
ALTER SEQUENCE ordem_servico_seq OWNED BY ordem_servico.id;



