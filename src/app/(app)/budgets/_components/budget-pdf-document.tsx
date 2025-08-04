
"use client";

import { CompanyInfo, HydratedBudget } from "@/lib/types";
import { format } from "date-fns";
import Image from "next/image";

type BudgetPdfDocumentProps = {
    budget: HydratedBudget;
    companyInfo?: CompanyInfo | null;
}

export const BudgetPdfDocument = ({ budget, companyInfo }: BudgetPdfDocumentProps) => {
    const logoSrc = companyInfo?.logoUrl || "https://placehold.co/150x80.png";
    const logoHint = companyInfo?.logoUrl ? "logo" : "logo house";

    return (
        <div id={`budget-pdf-${budget.id}`} className="p-8 bg-white text-gray-800 font-sans text-xs w-[210mm] min-h-[297mm]">
            <header className="flex justify-between items-start pb-4 border-b-2 border-black">
                <div className="flex items-center">
                    <Image src={logoSrc} alt="Company Logo" width={150} height={80} data-ai-hint={logoHint} />
                </div>
                <div className="text-right text-sm">
                    <h2 className="font-bold text-base">Bonis Marmoraria e Marcenaria</h2>
                    <p>CNPJ: 48.707.436/0001-74</p>
                    <p>Av. Antônio Estevam de Carvalho, 2309</p>
                    <p>Contato: (11) 95351-3181 Tiellison</p>
                    <p>Instagram: @Bonis_mm</p>
                </div>
            </header>

            <section className="mt-4">
                <div className="flex justify-between">
                    <div className="flex gap-2">
                        <p className="font-bold">Pré Orçamento nº:</p>
                        <p className="flex-grow px-2">{budget.id.substring(0, 6).toUpperCase()}</p>
                    </div>
                    <div className="flex gap-2">
                        <p className="font-bold">Data:</p>
                        <p className="px-2">{format(new Date(budget.createdAt), "dd/MM/yyyy")}</p>
                    </div>
                    <div className="flex gap-2">
                        <p className="font-bold">Atendente:</p>
                        <p className="px-2">Tabata</p>
                    </div>
                </div>
                 <div className="flex justify-between mt-2">
                    <div className="flex gap-2 w-2/3">
                        <p className="font-bold">Futuro Cliente:</p>
                        <p className="flex-grow px-2">{budget.customer.name}</p>
                    </div>
                     <div className="flex gap-2 w-1/3">
                        <p className="font-bold">Telefone:</p>
                        <p className="flex-grow px-2">{budget.customer.phone}</p>
                    </div>
                </div>
            </section>

            <section className="mt-6">
                <div className="bg-gray-800 text-white text-center p-1 font-bold">
                    MARMORARIA
                </div>
                <div className="border-l border-r border-b border-black p-4 space-y-4">
                    {budget.items.map((item, index) => (
                        <div key={index} className="flex gap-4 items-start">
                             {item.product.photoUrl && (
                                <div className="flex-shrink-0">
                                    <Image src={item.product.photoUrl} alt={item.product.name} width={80} height={80} className="object-cover rounded-md" data-ai-hint="product photo" />
                                </div>
                            )}
                            <div className="flex-grow">
                                <div className="flex justify-between">
                                    <p>0{index+1} {item.product.name}</p>
                                    <p className="font-bold">{item.unitValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="text-center text-xs mt-1">
                        <p>***Incluso recortes necessários, colagem da cuba (Fornecida pela cliente) e instalação no local***</p>
                    </div>
                </div>
            </section>
            
            <section className="mt-6">
                <div className="bg-gray-800 text-white text-center p-1 font-bold">
                    ORÇAMENTO REALIZADO COM BASE NA PLANTA BAIXA E INFORMAÇÕES DA CLIENTE.
                </div>
                <div className="border-l border-r border-b border-black p-4 text-xs space-y-1">
                    <p>As medidas podem ser alteradas após medição final.</p>
                    <p>Orçamento não contempla válvulas, acessórios inox, led, metalons e instalação elétrica e hidráulica</p>
                    <p>O móvel é feito 100% em MDF.</p>
                    <p>Orçamento realizado considerando caixas, portas e tamponamentos em 15mm.</p>
                    <p>Todas as dobradiças são com amortecedor e todas corrediças são reforçadas.</p>
                    <p>O prazo de entrega é de até 20 dias úteis após a medição final.</p>
                    <p>Pagamento: entrada 30% + saldo em até 12x sem juros no cartão / À vista: 7% de desconto</p>
                    <p>Este orçamento tem validade de 15 dias.</p>
                </div>
            </section>
        </div>
    )
}
