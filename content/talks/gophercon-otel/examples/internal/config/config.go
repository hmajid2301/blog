package config

import "os"

type Config struct {
	Port int
}

func Load() *Config {
	port := 8080
	if p := os.Getenv("PORT"); p != "" {
		// Simple port parsing could be added here
	}

	return &Config{
		Port: port,
	}
}
