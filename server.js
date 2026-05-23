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

    // DANE PRACOWNIKA
    doc
      .fontSize(16)
      .text(
        `Pracownik: ${employeeName || "Brak danych"}`
      );

    doc.moveDown();

    doc.text(
      `Laczny czas pracy: ${totalHours || "0h 0min"}`
    );

    doc.moveDown();

    doc.text(
      `Do wyplaty: ${amount || 0} zl`
    );

    doc.moveDown(2);

    // HISTORIA PRACY
    doc
      .fontSize(20)
      .text("Historia pracy");

    doc.moveDown();

    if (
      sessions &&
      sessions.length > 0
    ) {

      sessions.forEach(
        (
          session,
          index
        ) => {

          doc
            .fontSize(14)
            .text(
              `${index + 1}. ${
                session.location_name ||
                "Brak lokalizacji"
              }`
            );

          doc.text(
            `START: ${
              session.started_at ||
              "-"
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

    } else {

      doc
        .fontSize(14)
        .text(
          "Brak zapisanych sesji."
        );
    }

    // PODPIS
    doc.moveDown(3);

    doc
      .fontSize(16)
      .text(
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