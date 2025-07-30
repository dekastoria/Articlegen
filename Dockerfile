# Dockerfile untuk AI Article Generator (Next.js 15)

# Tahap 1: Instalasi dependensi
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

# Tahap 2: Membangun aplikasi untuk produksi
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set NEXTAUTH_URL sementara agar build tidak gagal
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
RUN npm run build

# Tahap 3: Menjalankan aplikasi di lingkungan produksi yang ringan
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Salin hasil build dari tahap sebelumnya
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Atur user non-root untuk keamanan
USER nextjs

EXPOSE 3000
ENV PORT=3000

# Jalankan aplikasi
CMD ["node", "server.js"]
