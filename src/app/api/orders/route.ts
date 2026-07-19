import { NextResponse } from "next/server";

// Middleware
import { parseJsonBody, withErrorHandling } from "@/backend/middleware";

// DTOs
import { parseCreateOrderDto } from "@/backend/dto/order.dto";

// Service
import { createOrder } from "@/backend/service/order.service";

/**
 * Places an order.
 *
 * `InvalidOrderError` from the DTO parser or the service is mapped to 400 by
 * the wrapper, so only the success path lives here.
 */
export const POST = withErrorHandling(async (request: Request) => {
  const body = await parseJsonBody(request);
  const order = await createOrder(parseCreateOrderDto(body));

  return NextResponse.json(order, { status: 201 });
});
