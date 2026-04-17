TERMINAL = kitty

all: server_web client_web
	@echo "¡La página web ha sido levantada exitosamente!"
client_web:
	@cd client && $(TERMINAL) --class "frontend" npm start > /dev/null 2>&1 &
	@echo "Iniciando frontend..."
	@sleep 2
server_web:
	@cd server && $(TERMINAL) --class "backend" docker compose up --build > /dev/null 2>&1 &
	@echo "Iniciando servidor backend..."
	@sleep 2
kill:
	@pkill -f "$(TERMINAL) --class backend"
	@pkill -f "$(TERMINAL) --class frontend"
