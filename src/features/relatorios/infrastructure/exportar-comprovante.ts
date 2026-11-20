export async function capturarComprovantePng(
  elemento: HTMLElement,
): Promise<Blob> {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(elemento, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
  });
  const response = await fetch(dataUrl);
  return response.blob();
}

/** Captura o documento HTML e monta PDF A4 (várias páginas se precisar). */
export async function gerarRelatorioPdfDoElemento(
  elemento: HTMLElement,
): Promise<Blob> {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(elemento, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
    width: elemento.scrollWidth,
    height: elemento.scrollHeight,
  });

  const img = await carregarImagem(dataUrl);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const larguraPaginaMm = pdf.internal.pageSize.getWidth();
  const alturaPaginaMm = pdf.internal.pageSize.getHeight();
  const larguraImagemMm = larguraPaginaMm;
  const alturaImagemMm = (img.height / img.width) * larguraImagemMm;

  let alturaRestante = alturaImagemMm;
  let posicaoY = 0;

  pdf.addImage(dataUrl, "PNG", 0, posicaoY, larguraImagemMm, alturaImagemMm);
  alturaRestante -= alturaPaginaMm;

  while (alturaRestante > 0) {
    posicaoY = alturaRestante - alturaImagemMm;
    pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, posicaoY, larguraImagemMm, alturaImagemMm);
    alturaRestante -= alturaPaginaMm;
  }

  return pdf.output("blob");
}

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao montar imagem do relatório."));
    img.src = src;
  });
}

export async function compartilharOuBaixarArquivo(
  blob: Blob,
  nomeArquivo: string,
  tituloCompartilhar: string,
): Promise<void> {
  const arquivo = new File([blob], nomeArquivo, { type: blob.type });
  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    navigator.canShare?.({ files: [arquivo] })
  ) {
    try {
      await navigator.share({ files: [arquivo], title: tituloCompartilhar });
      return;
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatarGeradoEm(): string {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}