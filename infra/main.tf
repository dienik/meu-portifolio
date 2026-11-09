# AST LAB — IaC: misconfigured infrastructure for the portfolio.

resource "aws_s3_bucket" "portfolio_assets" {
  bucket = "dienik-portfolio-assets"
  acl    = "public-read-write"
}

resource "aws_security_group" "api" {
  name = "portfolio-api"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "portfolio" {
  engine              = "mysql"
  instance_class      = "db.t3.micro"
  username            = "admin"
  password            = "Sup3rS3cr3tPassw0rd!"
  publicly_accessible = true
  storage_encrypted   = false
  skip_final_snapshot = true
}
