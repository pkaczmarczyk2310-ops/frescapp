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
      employeeName,
      totalHours,
      amount,
      sessions,
    } = req.body;

    const doc =
      new PDFDocument({
        margin: 50,
      });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ewidencja.pdf"
    );

    doc.pipe(res);

    // TYTUŁ
    doc
      .fontSize(26)
      .text(
        "Ewidencja czasu pracy",
        {
          align: "center",
        }
      );

    doc.moveDown(2);

    // DANE
    doc
      .fontSize(16)
      .text(
        `Pracownik: ${employeeName}`
      );

    doc.moveDown();

    doc.text(
      `Łączny czas pracy: ${totalHours}`
    );

    doc.moveDown();

    doc.text(
      `Do wypłaty: ${amount} zł`
    );

    doc.moveDown(2);

    // HISTORIA
    doc
      .fontSize(20)
      .text("Historia pracy");

    doc.moveDown();

    sessions.forEach(
      (session, index) => {

        doc
          .fontSize(14)
          .text(
            `${index + 1}. ${
              session.location_name
            }`
          );

        doc.text(
          `START: ${
            session.started_at
          }`
        );

        doc.text(
          `STOP: ${
            session.ended_at ||
            "W trakcie"
          }`
        );

        doc.moveDown();
      }
    );

    // PODPIS
    doc.moveDown(3);

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