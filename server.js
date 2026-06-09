
const {
  createClient,
} = require(
  "@supabase/supabase-js"
);
const path = require("path");


const express =
  require("express");

const cors =
  require("cors");

const PDFDocument =
  require("pdfkit");

const app =
  express();

const supabase =
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

// CORS
app.use(
  cors({
    origin: "*",
  })
);

app.use(
  express.json()
);

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

    // HEADERS
    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ewidencja.pdf"
    );

    doc.pipe(res);

    // FONT
    doc.font(
      path.join(
        __dirname,
        "fonts",
        "Roboto-Regular.ttf"
      )
    );

    // TYTUŁ
    doc
      .fontSize(28)
      .text(
        "Ewidencja czasu pracy",
        {
          align: "center",
        }
      );

    doc.moveDown(2);

    // DANE PRACOWNIKA
    doc
      .fontSize(18)
      .text(
        `Pracownik: ${
          employeeName ||
          "Brak danych"
        }`
      );

    doc.moveDown();

    doc.text(
      `Łączny czas pracy: ${
        totalHours ||
        "0h 0min"
      }`
    );

    doc.moveDown();

    doc.text(
      `Do wypłaty: ${
        Number(amount || 0).toFixed(2)
      } zł`
    );

    doc.moveDown(2);

    // HISTORIA
    doc
      .fontSize(22)
      .text(
        "Historia pracy"
      );

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

          const startDate =
            session.started_at
              ? new Date(
                  session.started_at
                ).toLocaleString(
                  "pl-PL"
                )
              : "-";

          const endDate =
            session.ended_at
              ? new Date(
                  session.ended_at
                ).toLocaleString(
                  "pl-PL"
                )
              : "W trakcie";

          doc
            .fontSize(15)
            .text(
              `${index + 1}. ${
                session.location_name ||
                "Brak lokalizacji"
              }`
            );

          doc.text(
            `START: ${startDate}`
          );

          doc.text(
            `STOP: ${endDate}`
          );

          doc.moveDown();
        }
      );

    } else {

      doc
        .fontSize(15)
        .text(
          "Brak zapisanych sesji."
        );
    }

    // PODPIS
    doc.moveDown(3);

    doc
      .fontSize(18)
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

app.get(
  "/",
  (req, res) => {

    res.send(
      "FrescApp działa 😎"
    );

  }
);

app.get(
  "/auto-close-sessions",

  async (req, res) => {

    const {
      error,
    } = await supabase

      .from("work_sessions")

      .update({

        ended_at:
          new Date()
            .toISOString(),

        is_active: false,

        closed_automatically:
          true,
      })

      .eq(
        "is_active",
        true
      );

    if (error) {

      console.log(error);

      return res
        .status(500)
        .json(error);
    }

    res.json({
      success: true,
      message:
        "Zmiany zamknięte 😎",
    });
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