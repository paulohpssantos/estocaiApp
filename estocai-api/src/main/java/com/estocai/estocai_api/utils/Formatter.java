package com.estocai.estocai_api.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Formatter {

    public static String formatDateBR(String isoDate) {
        if (isoDate == null || isoDate.isBlank()) {
            return "";
        }
        try {
            LocalDate ld = LocalDate.parse(isoDate); // espera yyyy-MM-dd
            DateTimeFormatter out = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            return ld.format(out);
        } catch (Exception e) {
            // se falhar, retorna a string original para não quebrar fluxo
            return isoDate;
        }
    }

}
