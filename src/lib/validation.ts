// Zod com mensagens em pt-BR. Importe `z` daqui (servidor e formulários), não direto de "zod".
import { z } from "zod";

z.config(z.locales.ptBR());

export { z };
