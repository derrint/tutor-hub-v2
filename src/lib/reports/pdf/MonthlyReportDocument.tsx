import type { MonthlyReportContentV1 } from "@/lib/reports/content-schema";
import { reportPdfBackgroundPath } from "@/lib/reports/pdf/background-path";
import { reportPdfCopy } from "@/lib/reports/pdf/copy";
import { reportPdfPalette } from "@/lib/reports/pdf/palette";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import React from "react";

export type MonthlyReportPdfProps = {
  studentName: string;
  periodLabel: string;
  tutorDisplayName: string;
  content: MonthlyReportContentV1;
};

const styles = StyleSheet.create({
  page: {
    position: "relative",
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontFamily: "Quicksand",
    fontSize: 10.5,
    color: reportPdfPalette.ink,
    lineHeight: 1.5,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  foreground: {
    position: "relative",
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: reportPdfPalette.royalBlue,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  rule: {
    borderBottomWidth: 2,
    borderBottomColor: reportPdfPalette.rule,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  metaBox: {
    flex: 1,
    backgroundColor: reportPdfPalette.royalBlue,
    borderWidth: 2.5,
    borderColor: reportPdfPalette.border,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  metaText: {
    color: reportPdfPalette.white,
    fontSize: 11,
    fontWeight: 600,
    textAlign: "center",
  },
  canvaSection: {
    marginBottom: 11,
    borderWidth: 2.5,
    borderColor: reportPdfPalette.border,
    borderRadius: 10,
    overflow: "hidden",
  },
  canvaSectionHeader: {
    backgroundColor: reportPdfPalette.royalBlue,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  canvaSectionTitle: {
    color: reportPdfPalette.white,
    fontSize: 12,
    fontWeight: 700,
    textAlign: "center",
  },
  canvaSectionBody: {
    backgroundColor: reportPdfPalette.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingRight: 6,
  },
  bulletDot: {
    width: 12,
    fontWeight: 700,
  },
  bulletText: {
    flex: 1,
  },
  page2Title: {
    fontSize: 22,
    fontWeight: 700,
    color: reportPdfPalette.royalBlue,
    textAlign: "center",
    marginBottom: 8,
  },
  photoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 6,
    marginBottom: 14,
  },
  photoCell: {
    width: 155,
    height: 200,
    borderWidth: 2,
    borderColor: reportPdfPalette.border,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: reportPdfPalette.white,
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  notesOuter: {
    borderWidth: 2.5,
    borderColor: reportPdfPalette.border,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  notesHeader: {
    backgroundColor: reportPdfPalette.royalBlue,
    paddingVertical: 10,
  },
  notesHeaderText: {
    color: reportPdfPalette.white,
    fontSize: 13,
    fontWeight: 700,
    textAlign: "center",
  },
  notesBody: {
    backgroundColor: reportPdfPalette.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 120,
  },
  notesParagraph: {
    fontSize: 10.5,
    lineHeight: 1.55,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  signatureBlock: {
    width: 150,
    borderWidth: 2.5,
    borderColor: reportPdfPalette.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  signaturePad: {
    height: 72,
    backgroundColor: reportPdfPalette.white,
    justifyContent: "center",
    alignItems: "center",
  },
  signatureLine: {
    width: 90,
    borderBottomWidth: 1.5,
    borderBottomColor: reportPdfPalette.ink,
    marginBottom: 6,
  },
  signatureNameBar: {
    backgroundColor: reportPdfPalette.white,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderTopWidth: 2,
    borderTopColor: reportPdfPalette.border,
  },
  signatureName: {
    fontSize: 8.5,
    fontWeight: 600,
    textAlign: "center",
    lineHeight: 1.35,
  },
});

function PageBackground() {
  return (
    <View style={styles.background} fixed>
      <Image src={reportPdfBackgroundPath()} style={{ width: "100%", height: "100%" }} />
    </View>
  );
}

function ReportHeader({
  studentName,
  periodLabel,
  titleStyle,
}: {
  studentName: string;
  periodLabel: string;
  titleStyle: typeof styles.title | typeof styles.page2Title;
}) {
  return (
    <>
      <Text style={titleStyle}>{reportPdfCopy.title}</Text>
      <View style={styles.rule} />
      <View style={styles.metaRow}>
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>
            {reportPdfCopy.nameLabel}: {studentName}
          </Text>
        </View>
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>
            {reportPdfCopy.periodLabel}: {periodLabel}
          </Text>
        </View>
      </View>
      <View style={styles.rule} />
    </>
  );
}

function BulletSection({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.canvaSection}>
      <View style={styles.canvaSectionHeader}>
        <Text style={styles.canvaSectionTitle}>{title}</Text>
      </View>
      <View style={styles.canvaSectionBody}>
        {items.length === 0 ? (
          <Text>—</Text>
        ) : (
          items.map((line, index) => (
            <View
              key={`${index}-${line.slice(0, 16)}`}
              style={styles.bulletRow}
            >
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function PhotoStrip({ photos }: { photos: MonthlyReportContentV1["photos"] }) {
  if (photos.length === 0) return null;

  const rows: MonthlyReportContentV1["photos"][] = [];
  for (let i = 0; i < photos.length; i += 3) {
    rows.push(photos.slice(i, i + 3));
  }

  return (
    <>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.photoRow}>
          {row.map((photo) => (
            <View key={photo.id} style={styles.photoCell}>
              <Image src={photo.dataUrl} style={styles.photo} />
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

function NotesBlock({ notes }: { notes: string }) {
  const trimmed = notes.trim();
  return (
    <View style={styles.notesOuter}>
      <View style={styles.notesHeader}>
        <Text style={styles.notesHeaderText}>{reportPdfCopy.sectionNotes}</Text>
      </View>
      <View style={styles.notesBody}>
        <Text style={styles.notesParagraph}>{trimmed || "—"}</Text>
      </View>
    </View>
  );
}

function SignatureBlock({ tutorDisplayName }: { tutorDisplayName: string }) {
  if (!tutorDisplayName.trim()) return null;

  return (
    <View style={styles.signatureRow}>
      <View style={styles.signatureBlock}>
        <View style={styles.signaturePad}>
          <View style={styles.signatureLine} />
        </View>
        <View style={styles.signatureNameBar}>
          <Text style={styles.signatureName}>{tutorDisplayName}</Text>
        </View>
      </View>
    </View>
  );
}

export function MonthlyReportDocument({
  studentName,
  periodLabel,
  tutorDisplayName,
  content,
}: MonthlyReportPdfProps) {
  const hasPage2 =
    content.photos.length > 0 ||
    content.notes.trim().length > 0 ||
    tutorDisplayName.trim().length > 0;

  return (
    <Document title={`${reportPdfCopy.title} — ${studentName}`}>
      <Page size="A4" style={styles.page}>
        <PageBackground />
        <View style={styles.foreground}>
          <ReportHeader
            studentName={studentName}
            periodLabel={periodLabel}
            titleStyle={styles.title}
          />

          <BulletSection
            title={reportPdfCopy.sectionCanDo}
            items={content.canDoThis}
          />
          <BulletSection
            title={reportPdfCopy.sectionStillLearning}
            items={content.stillLearning}
          />
          <BulletSection
            title={reportPdfCopy.sectionNextGoals}
            items={content.nextGoals}
          />
        </View>
      </Page>

      {hasPage2 && (
        <Page size="A4" style={styles.page}>
          <PageBackground />
          <View style={styles.foreground}>
            <ReportHeader
              studentName={studentName}
              periodLabel={periodLabel}
              titleStyle={styles.page2Title}
            />

            <PhotoStrip photos={content.photos} />
            <NotesBlock notes={content.notes} />
            <SignatureBlock tutorDisplayName={tutorDisplayName} />
          </View>
        </Page>
      )}
    </Document>
  );
}
