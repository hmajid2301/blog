---
title: "How to Use Env Variables With Viper Config Library in Go"
date: 2024-05-19
canonicalURL: https://haseebmajid.dev/posts/2024-05-19-how-to-use-env-variables-with-viper-config-library-in-go
tags:
  - viper
  - config
  - go
series:
  - Building a CLI tool in Golang
cover:
  image: images/cover.png
---

This is part of a series of where I am going to blog about issues I had building my CLI tool OptiNix and documenting
how I resolved those issues. Most will be random things not specifically related to building CLI tools.

In this example, we will use the [viper](https://github.com/spf13/viper) library. Mainly because I am already using cobra, the library to help us make CLI tools.
From the same author and wanted to see how well they integrated. The Viper config library is probably over kill
in my case.

In my CLI tool, I wanted the tool to be able to see ENV variables to overwrite certain functionality. This made it much
easier to test my app and also gives more flexibility to the end user.
However, I also wanted to have all of my config in a struct. For example, take a simplified version of the config of
OptiNix.

```go
type Sources struct {
	NixOSURL       string `mapstructure:"nixos_url"`
	HomeManagerURL string `mapstructure:"home_manager_url"`
}

type Config struct {
	DBFolder string  `mapstructure:"db_folder"`
	Sources  Sources `mapstructure:"sources"`
}
```

How can we update this using an environment variable, say we wanted to set the database folder path using an env variable called?
`OPTINIX_DB_FOLDER`, this code shows how he could do this and then return a struct of type `Config`.

```go
func LoadConfig() (*Config, error) {
	config := &Config{}

	viper.SetEnvPrefix("optinix")
	viper.SetEnvKeyReplacer(strings.NewReplacer(`.`, `_`))
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return config, err
		}
	}

	viper.SetDefault("db_folder", "testfolder")
	err = viper.Unmarshal(config)
	if err != nil {
		return config, fmt.Errorf("unable to decode into config struct, %v", err)
	}

	return config, nil
}
```

We can then access the folder like `config.DBFolder`. Let's break this code down a bit to understand what is happening.

```go
viper.SetEnvPrefix("optinix")
viper.SetEnvKeyReplacer(strings.NewReplacer(`.`, `_`))
viper.AutomaticEnv()
```

This first part is all around loading in env variables to viper. What we are doing here is first loading env variables
that start with `OPTINIX`. Using the prefix means we don't have to specify it in each of our config options reducing
boilerplate. However, it also means then our env variables will not conflict with other apps and services.

The next two lines means that we can import environment variables correctly. This is mainly important for the nested
struct we have, i.e. `sources`. We can set the sources like so `OPTINIX_SOURCES_NIXOS_URL`. Without the replacement,
it would something like `OPTINIX_SOURCES.`. The final line loads the env variables into viper.

```go
if err := viper.ReadInConfig(); err != nil {
    if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
        return config, err
    }
}

viper.SetDefault("db_folder", "testfolder")
viper.SetDefault("sources.nixos_url", "example.com/nix.hmtl")
```

Then we load all the config options into Viper. One thing to note is viper can also read config from files as well.
So this part handles that. Then finally, if the database folder is not set via env variable, we give it a default value.
We can see with the nested struct `sources` we use a `.`, to specify the field inside that struct.


```go
err = viper.Unmarshal(config)
if err != nil {
    return config, fmt.Errorf("unable to decode into config struct, %v", err)
}

return config, nil
```

Then in the final part of this function, we unmarshal the viper config into our config struct and return that config.
We can then call this in our `main.go` and pass the config around to the relevant parts of our code.

Not only does this make our code easier to test, as we can pass in config and set tests to use a local URL, for example.
Maybe a mock server in a Docker container. Then also provides flexibility to our user of the CLI.

That's it! We can now use environment variables to fill in our config struct using the viper config library.
