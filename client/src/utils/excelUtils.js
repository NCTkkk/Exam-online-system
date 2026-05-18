import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Hàm hỗ trợ xuất danh sách bài nộp ra file Excel có định dạng màu sắc nâng cao
 * @param {Array} submissions - Danh sách bài nộp đã được lọc
 * @param {String} examTitle - Tiêu đề của đề thi
 * @param {Object} currentFilters - Đối tượng chứa các giá trị bộ lọc hiện tại
 */
export const exportSubmissionsToExcel = async (
  submissions,
  examTitle,
  currentFilters,
) => {
  if (!submissions || submissions.length === 0) {
    alert("Không có dữ liệu phù hợp để xuất file!");
    return;
  }

  // 1. Thu thập trạng thái bộ lọc
  const { studentSearch, statusFilter, extremeFilter, rangeMin, rangeMax } =
    currentFilters;
  const statusText =
    statusFilter === "all"
      ? "Tất cả"
      : statusFilter === "graded"
        ? "Đã chấm"
        : "Chờ chấm";
  const extremeText =
    extremeFilter === "all"
      ? "Tất cả"
      : extremeFilter === "highest"
        ? "Điểm cao nhất"
        : "Điểm thấp nhất";
  const rangeText =
    rangeMin || rangeMax ? `${rangeMin || 0}đ -> ${rangeMax || 10}đ` : "Tất cả";

  // 2. Khởi tạo Workbook và Worksheet từ exceljs
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Kết quả bộ lọc");

  // 3. Thêm phần Metadata bộ lọc ở các dòng đầu
  worksheet.addRow(["BÁO CÁO KẾT QUẢ BÀI NỘP ĐỀ THI"]);
  worksheet.addRow(["Tên đề thi:", examTitle]);
  worksheet.addRow(["Ngày xuất file:", new Date().toLocaleString("vi-VN")]);
  worksheet.addRow([]);
  worksheet.addRow(["THÔNG TIN BỘ LỌC ĐANG ÁP DỤNG:"]);
  worksheet.addRow(["- Tìm kiếm tên:", studentSearch || "(Trống)"]);
  worksheet.addRow(["- Trạng thái chấm:", statusText]);
  worksheet.addRow(["- Phân loại bài làm:", extremeText]);
  worksheet.addRow(["- Khoảng điểm lọc:", rangeText]);
  worksheet.addRow([]); // Hàng trống thứ 10

  // Định dạng chữ đậm cho phần Header Metadata
  worksheet.getCell("A1").font = {
    name: "Arial",
    size: 16,
    bold: true,
    color: { argb: "FF1E293B" },
  };
  worksheet.getCell("A5").font = {
    name: "Arial",
    size: 12,
    bold: true,
    color: { argb: "FF475569" },
  };

  // 4. Thêm hàng TIÊU ĐỀ BẢNG (Dòng 11)
  const headers = [
    "STT",
    "Họ và tên thí sinh",
    "Địa chỉ Email",
    "Điểm Trắc Nghiệm",
    "Điểm Tự Luận",
    "Tổng Điểm Kết Quả",
    "Trạng Thái",
    "Ngày Giờ Nộp Bài",
  ];
  const headerRow = worksheet.addRow(headers);

  // 🌟 CSS BACKGROUND CHO TIÊU ĐỀ BẢNG & BORDER & CHỮ TRẮNG
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" }, // Màu nền Slate-900 sang trọng giống giao diện web
    };
    cell.font = {
      name: "Arial",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF334155" } },
      left: { style: "thin", color: { argb: "FF334155" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF334155" } },
    };
  });
  headerRow.height = 28;

  // 5. Thêm dữ liệu học sinh & Xử lý CSS theo điều kiện logiс từng hàng
  submissions.forEach((s, idx) => {
    const scoreAuto = Number(s.scoreAuto) || 0;
    const scoreManual = s.scoreManual !== undefined ? Number(s.scoreManual) : 0;
    const totalScore = scoreAuto + scoreManual;
    const statusStr = s.status === "graded" ? "Đã chấm" : "Chờ chấm";
    const dateStr = new Date(s.createdAt).toLocaleString("vi-VN");

    const rowData = [
      idx + 1,
      s.student?.name || "N/A",
      s.student?.email || "N/A",
      s.scoreAuto,
      s.scoreManual !== undefined ? s.scoreManual : "—",
      totalScore,
      statusStr,
      dateStr,
    ];

    const dataRow = worksheet.addRow(rowData);
    dataRow.height = 24;

    // Thiết lập border căn bản và căn lề cho mọi ô trong dòng dữ liệu
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 10 };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 2 || colNumber === 3 ? "left" : "center",
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });

    // 🌟 ĐIỀU KIỆN 1: STYLE CHO CỘT TRẠNG THÁI (CỘT 7)
    const statusCell = dataRow.getCell(7);
    if (s.status === "graded") {
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDCFCE7" },
      }; // Xanh lá nhạt
      statusCell.font = {
        name: "Arial",
        size: 10,
        bold: true,
        color: { argb: "FF15803D" },
      };
    } else {
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEF3C7" },
      }; // Vàng nhạt
      statusCell.font = {
        name: "Arial",
        size: 10,
        bold: true,
        color: { argb: "FFB45309" },
      };
    }

    // 🌟 ĐIỀU KIỆN 2: STYLE PHÂN CẤP ĐIỂM SỐ CHO CỘT TỔNG ĐIỂM (CỘT 6)
    const totalScoreCell = dataRow.getCell(6);
    totalScoreCell.font = { name: "Arial", size: 11, bold: true };

    // Giả định thang điểm tối đa là 10đ để tính toán %, bạn có thể đổi số 10 này thành điểm tối đa thực tế của đề thi nếu có biến
    const maxExamScore = 10;
    const percentage = (totalScore / maxExamScore) * 100;

    if (percentage < 50) {
      // Dưới 50%: Màu đỏ
      totalScoreCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEE2E2" },
      };
      totalScoreCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF991B1B" },
      };
    } else if (percentage < 70) {
      // Dưới 70%: Màu hồng
      totalScoreCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF0E6FF" },
      }; // Hồng tím nhẹ dịu mắt
      totalScoreCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "%%" },
      };
      totalScoreCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF9D174D" },
      };
    } else if (percentage < 80) {
      // Dưới 80%: Màu xanh dương
      totalScoreCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEFF6FF" },
      };
      totalScoreCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF1E40AF" },
      };
    } else if (percentage < 90) {
      // Dưới 90%: Màu vàng
      totalScoreCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEF3C7" },
      };
      totalScoreCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF92400E" },
      };
    } else {
      // Còn lại (Từ 90% trở lên): Màu xanh lá cây
      totalScoreCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD1FAE5" },
      };
      totalScoreCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF065F46" },
      };
    }
  });

  // 6. TỰ ĐỘNG CĂN CHỈNH ĐỘ RỘNG CỘT (AUTO FIT WIDTHS) CHỐNG TRÀN CHỮ
  worksheet.columns.forEach((column, index) => {
    let maxLength = 12; // Mặc định tối thiểu rộng 12 ký tự

    // Quét qua tất cả hàng từ hàng số 11 trở đi (để tránh bị ảnh hưởng bởi dòng text tiêu đề dài ở dòng 1)
    column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber >= 11 && cell.value) {
        const cellLength = cell.value.toString().length;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      }
    });
    // Cộng thêm khoảng đệm an toàn phòng ngừa hiển thị Font chữ
    column.width = maxLength + 4;
  });

  // Khống chế cột tiêu đề Metadata cố định rộng ra chút
  worksheet.getColumn(1).width = 18;
  worksheet.getColumn(2).width = 28;

  // 7. Tạo Buffer và Trigger tải xuống Client bằng file-saver
  const buffer = await workbook.xlsx.writeBuffer();
  const safeExamTitle = (examTitle || "De_thi")
    .slice(0, 30)
    .replace(/\s+/g, "_");
  const fileName = `Bao_Cao_Dinh_Dang_${safeExamTitle}_${Date.now()}.xlsx`;

  saveAs(new Blob([buffer]), fileName);
};
