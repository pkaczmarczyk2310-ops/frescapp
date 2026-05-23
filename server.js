const express =
  require("express");

const cors =
  require("cors");

const PDFDocument =
  require("pdfkit");

const app =
  express();

app.use(cors());

app.use(express.json());

app.post(
  "/generate-pdf",

  async (req, res) => {

    const {
      employee,
      hours,
      salary,
    } = req.body;

    const doc =
      new PDFDocument();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",

      `attachment; filename=rozliczenie.pdf`
    );

    doc.pipe(res);

    doc.fontSize(28)
      .text(
        "Rozliczenie pracownika"
      );

    doc.moveDown();

    doc.fontSize(18)
      .text(
        `Pracownik: ${employee}`
      );

    doc.moveDown();

    doc.text(
      `Godziny: ${hours}`
    );

    doc.moveDown();

    doc.text(
      `Do wypłaty: ${salary} zł`
    );

    doc.moveDown(2);

    doc.text(
      "Podpis pracownika:"
    );

    doc.moveDown(4);

    doc.text(
      "______________________"
    );

    doc.end();
  }
);

app.listen(
  3001,

  () => {

    console.log(
      "PDF server działa 😎"
    );
  }
);