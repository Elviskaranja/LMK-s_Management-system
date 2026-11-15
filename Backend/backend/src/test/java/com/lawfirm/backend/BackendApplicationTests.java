package com.lawfirm.backend;

import com.lawfirm.backend.entity.Invoice;
import com.lawfirm.backend.entity.Payment;
import com.lawfirm.backend.repository.InvoiceRepository;
import com.lawfirm.backend.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class BackendApplicationTests {

	@Autowired
	private InvoiceRepository invoiceRepository;

	@Autowired
	private PaymentRepository paymentRepository;

	@Test
	void contextLoads() {
	}

	@Test
	@Transactional(readOnly = true)
	void outstandingFeesSubtractPaymentsPerInvoiceWithoutGoingNegative() {
		Map<Integer, BigDecimal> paidByInvoice = paymentRepository.findAll().stream()
				.collect(Collectors.groupingBy(
						payment -> payment.getInvoice().getInvoiceId(),
						Collectors.reducing(
								BigDecimal.ZERO,
								Payment::getAmount,
								BigDecimal::add)));

		BigDecimal expectedOutstanding = invoiceRepository.findAll().stream()
				.map(invoice -> outstandingBalance(invoice, paidByInvoice))
				.reduce(BigDecimal.ZERO, BigDecimal::add);
		BigDecimal actualOutstanding = invoiceRepository.sumOutstandingBalancesAcrossInvoices();

		assertEquals(0, expectedOutstanding.compareTo(actualOutstanding));
	}

	private BigDecimal outstandingBalance(
			Invoice invoice,
			Map<Integer, BigDecimal> paidByInvoice) {
		return invoice.getTotalAmount()
				.subtract(paidByInvoice.getOrDefault(invoice.getInvoiceId(), BigDecimal.ZERO))
				.max(BigDecimal.ZERO);
	}

}
